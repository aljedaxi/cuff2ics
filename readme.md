# cuff 2 ical

create a textfile with urls, one per line, eg

```
https://www.calgaryundergroundfilm.org/2025/positions/
https://www.calgaryundergroundfilm.org/2025/shorts-package-a-series-of-startling-events/
https://www.calgaryundergroundfilm.org/2025/shorts-package-laughing-through-life-and-death/
https://www.calgaryundergroundfilm.org/2025/predators/
https://www.calgaryundergroundfilm.org/2025/move-ya-body-the-birth-of-house/
https://www.calgaryundergroundfilm.org/2025/no-one-died-the-wing-bowl-story/
https://www.calgaryundergroundfilm.org/2025/u-are-the-universe/
https://www.calgaryundergroundfilm.org/2025/the-last-podcast/
https://www.calgaryundergroundfilm.org/2025/tucker-dale-vs-evil-15th-anniversary-2010/
```

and name it `cuff.txt`. then run `make cuff.ics`. it'll download each of the urls, and parse out one calendar file with all your cuff movies for this year.
