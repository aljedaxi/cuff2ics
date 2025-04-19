import {JSDOM} from 'jsdom'
import {toMilitary} from 'midday'
import ical from 'ical-generator'
import readline from 'readline'
import {parseArgs} from 'node:util'
import {mkdir, writeFile} from 'node:fs/promises'
import {join} from 'node:path'
const options = {
    multi: {short: 'm', type: 'boolean', default: false},
    multiDir: {type: 'string', default: 'cal'},
}
const {values: {multi, multiDir}} = parseArgs({options})

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


class Event {
    static fromUrl = url => fetch(url).then(r => r.text()).then(text => {
        const {window: {document}} = new JSDOM(text)
        const events = this.fromDoc(document)
        events.forEach(o => Object.assign(o, {url}))
        return events
    })
    static fromDoc = document => {
        const summary = document.querySelector('h1').innerHTML
        const dateTimes = document.querySelectorAll('.date-time')
        return [...dateTimes].map(dateTime => {
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
            return new Event({summary, start, end})
        })
    }
    constructor(props) {
        Object.assign(this, props)
    }
}

const promises = []
for await (const url of rl) {
    promises.push(Event.fromUrl(url))
}

Promise.all(promises).then((ess) => {
    if (!multi) {
        const calendar = ical({name: 'my epic CUFF week!'})
        ess.forEach(events => events.forEach(e => calendar.createEvent(e)))
        console.log(calendar.toString())
        return
    }
    const __dirname = import.meta.dirname
    return mkdir(join(__dirname, multiDir), {recursive: true}).then(_dirCreation => {
        return ess.flatMap(es => es.map(event => {
            const {summary} = event
            const calendar = ical({name: summary})
            calendar.createEvent(event)
            const filename = join(__dirname, multiDir, `${summary.replace(/\s/g, '-')}.ics`)
            return writeFile(filename, calendar.toString())
        }))
    })
})
