# JoomlaControl

A collection of scripts to control and update the creation and update of a local joomla module/lugin/component.

Controlable through a simple cli in the console.

## Why?

JoomlaControl was built because I was sick of manually linking and copying all the component stuff from my working directory to my local test installation.

It started as some unconnected scripts to make my work easier and ended as this.

## HowTo

### Get Ready

First please make sure [nodejs](https://nodejs.org/en/) is in your path.

Get one of the releases or use git clone to copy joommaster into a directory.

Then run `npm install` in the directory.

I always liked to have a global folder and a seperate folder for each extension I am working with as well as a scripts folder to put it stuff like this.

### Start working

If you have no idea how to start there is a nice tutorial on how to create a Joomla [component](https://docs.joomla.org/J3.x:Developing_an_MVC_Component), [plugin](https://docs.joomla.org/J3.x:Creating_a_Plugin_for_Joomla), or [module](https://docs.joomla.org/J3.x:Creating_a_simple_module/Developing_a_Basic_Module).

Install your extension once and then fix the ``config.json´´ file in the directory of joommaster to fit your needs.

### Don't care about syncing your work

Run `node joommaster.js`.

The script will check for changes in your files and will propagate them to the directory of your local installation.


## Disclaimer

You should *NOT* use this for a running active installation of Joomla.

This script is purely for developing and quick testing. Not properly updating your extension through packing it and then installing it in the interface or by cli may severly damage the CMS.

Bad for a local test but hellofawork for any live installation.

## Developement

I am actively working on extending the scripts.

Here is a list of things I have in mind:

* automatic packaging
* bootstrapping extensions
* correctly updating via Joomla-cli
* asset manager (bower or similar)
* git integration

## Licence

The collection is licenced under GPL3.0.

Copyright holder is me, Markus Flür.
