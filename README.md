# ClubHouse CLI Tool

This is a small utility to make it easier and faster to create tickets in [clubhouse](http://clubhouse.io). 
It is meant to just ask a few important questions and create a story, not be a full featured CLI tool.

## Usage
```bash
npm install -g chcli --registry http://npm.adrise.tv
# may need sudo
sudo npm install -g chcli --registry http://npm.adrise.tv

chcli
```
Upon first run, the cli will walk you through a quick setup routine. Settings are saved in ~/.chcli/config.
For help in obtaining an API token, see [the clubhouse documentation](https://help.clubhouse.io/hc/en-us/articles/205701199-Clubhouse-API-Tokens)

Note: Node v6 or higher is required