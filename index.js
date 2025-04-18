import {JSDOM} from 'jsdom'
import {toMilitary} from 'midday'
import ical from 'ical-generator'
import readline from 'readline'

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false,
})

const selectors = (e, ...selectors) =>
    Object.fromEntries(
        selectors.map(s => [s.replace('.', ''), e.querySelector(s)?.innerHTML])
    )
const deAbbr = {Apr: '04'}

const year = new Date().getFullYear()
const zone = new Date().getTimezoneOffset()

const calendar = ical({name: 'my epic CUFF week!'})

const promises = []
for await (const url of rl) {
    promises.push(
        fetch(url)
            .then(r => r.text())
            .then(text => {
                const {window: {document}} = new JSDOM(text)
                const summary = document.querySelector('h1').innerHTML
                const dateTimes = document.querySelectorAll('.date-time')
                for (const dateTime of dateTimes) {
                    const {month, day, time} = selectors(dateTime, '.month', '.day', '.time')
                    const duration = [...document.querySelector('#detailsColumn').querySelectorAll('div')]
                        .flatMap(e => /\d+ minutes/.exec(e.innerHTML)?.[0])
                        .filter(Boolean)?.[0]
                    if (!/minutes/i.test(duration)) {
                        console.error(duration)
                        throw new Error('something wrong. this should be in minutes?')
                    }
                    const minutes = parseInt(/\d+/.exec(duration)?.[0], 10)
                    const mTime = toMilitary(time)
                    const start = new Date(`${year}-${deAbbr[month]}-${day}T${mTime}-06:00`)
                    const end = new Date(start)
                    end.setMinutes(end.getMinutes() + minutes)
                    const eventSpec = {summary, url, start, end}
                    calendar.createEvent(eventSpec)
                }
            })
        )
}

Promise.all(promises).then(() => console.log(calendar.toString()))
