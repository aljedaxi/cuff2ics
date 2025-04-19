cuff.ics: cuff.txt
	@node index.js < $< > $@

cal: cuff.txt
	@node index.js --multi < $<
