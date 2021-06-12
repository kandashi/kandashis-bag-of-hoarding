![](https://img.shields.io/badge/Foundry-v0.8.6-informational)

![Latest Release Download Count](https://img.shields.io/github/downloads/kandashi/kandashis-bag-of-hoarding/latest/module.zip)

![Forge Installs](https://img.shields.io/badge/dynamic/json?label=Forge%20Installs&query=package.installs&suffix=%25&url=https%3A%2F%2Fforge-vtt.com%2Fapi%2Fbazaar%2Fpackage%2Fkandashis-bag-of-hoarding&colorB=4aa94a)

Adds a way to draw random loot from compendiums. It also comes with a community driven item compendium to draw from.

Please do provide items through a pull request of an issue on the github page.


You can generate loot through the gem icon in the token menu on the left side, or by using various commands:

     * @param {number} costLimit price limit
     * @param {number} quantity items to draw
     * @param {string} itemType string of the item type to draw from
     * @param {string} packKey pack key to draw from
`BoH.randomItemToChat(costLimit, quantity, itemType, pack)`


     * @param {number} costLimit price limit
     * @param {number} quantity items to draw
     * @param {Array} tokenArray array of tokens 
     * @param {string} itemType string of the item type to draw from
     * @param {string} packKey pack key to draw from
`BoH.randomItemToActor(costLimit, quantity, tokenArray, itemType, pack)`

