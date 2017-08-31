# Limit Block Type plugin 1.0.2 for Craft CMS ![Craft 2.6](https://img.shields.io/badge/craft-2.6-green.svg?style=flat-square)

Craft CMS plugin adding option to limit individual Matrix block types.  

![Adding a maximum number of blocks to individual block types](http://g.recordit.co/AFk5hOEwzu.gif)  

## What?

Matrix is lacking an important feature – the ability to limit blocks per block type.  
This tiny plugin (which was surprisingly difficult to build) fixes that.  

Limit Block Type works with your existing Matrix fields.  

## Usage 

Add the desired number of max blocks to your each of your block types’ settings (by clicking the block type settings’ cogwheel inside the Matrix configurator). Profit.  

## Caution

Limit Block Type is basically one huge hack, and could break at any time (for instance, if P&T redesigns the Craft Control Panel). The plugin is designed to die gracefully and not kill your editing experience if it ever stops working, but please keep this in mind.  

Also, if P&T ever adds this feature to the core, this plugin will immediately be retired. +1 for core feature, though – [please vote for the feature request](https://craftcms.uservoice.com/forums/285221-feature-requests/suggestions/7192758-limit-matrix-blocks-per-block-type)!

## Installation

To install Limit Block Type, follow these steps:

1. Download & unzip the file and place the `limitblocktype` directory into your `craft/plugins` directory
 2.  -OR- do a `git clone https://github.com/mmikkel/limitblocktype.git` directly into your `craft/plugins` folder.  You can then update it with `git pull`
4. Install plugin in the Craft Control Panel under Settings > Plugins
5. The plugin folder should be named `limitblocktype` for Craft to see it.  GitHub recently started appending `-master` (the branch name) to the name of the folder for zip file downloads.

**Limit Block Type requires Craft 2.6.x or newer.**

## Disclaimer, support

This plugin is provided free of charge and you can do whatever you want with it. Limit Block Type is unlikely to mess up your stuff, but just to be clear: the author is not responsible for data loss or any other problems resulting from the use of this plugin.  

Please report any bugs, feature requests or other issues [here](https://github.com/mmikkel/limitblocktype/issues). Note that this is a hobby project and no promises are made regarding response time, feature implementations or bug fixes.  


## Limit Block Type Changelog

### 1.0.2 –– 2017.08.31

* Fixes an issue where Limit Block Type would break password resets (undefined index)

### 1.0.1 -- 2016.09.03

* Fixed a bug

### 1.0.0 -- 2016.09.03

* Initial release

Brought to you by [Mats Mikkel Rummelhoff](http://mmikkel.no)
