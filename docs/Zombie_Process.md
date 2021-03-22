# Zombie processes

While developing on `minecraft-assets-reader`, it's possible to hit certain types of crashes where the app can't be exited. In this
case,  you'll likely end up with an `ngrok` ["zombie process"](https://en.wikipedia.org/wiki/Zombie_process). 

**Zombie processes cannot be directly stopped or killed - you must kill the parent process to stop it**.

## Suggestions to fix it

### General
1. Track down the parent process that's running it and kill _that_ process

### `minecraft-assets-reader`-specific
1. Close all terminal windows > wait several seconds > reopen the terminal
    * Open the System Monitor > search for `ngrok` > Select "End/Kill process" (if it's still there) > continue testing!