class BoH {
    /**
     * 
     * @param {number} costLimit price limit
     * @param {number} quantity items to draw
     * @param {string} itemType string of the item type to draw from
     * @param {string} packKeys pack keys to draw from
     * @returns Array of Items
     */
     static async randomItem(costLimit = 10000, quantity = 1, itemType, packKeys = ["kandashis-bag-of-hoarding.hoardingitems"]) {
         costLimit = costLimit === 0 ? 1000 : costLimit
        let itemArray = []
        let contents = []
        for (let pack of packKeys) {
            const packContent = await game.packs.get(pack).getDocuments()
            let filtered = packContent.filter(i => {
                if (i.data.data.price <= costLimit || !i.data.data.price) {
                    if (!!itemType && i.data.type === itemType) {
                        return true
                    }
                    if (!itemType) {
                        return true
                    }
                }
                return false
            })
            contents = contents.concat(filtered)
        }
        if (contents.length < 1) { console.warn("Bag of Hoarding: no items found"); return false }
        for (let i = 0; i < quantity; i++) {
            let index = BoH.getRandomInt(contents.length)
            itemArray.push(contents[index])
        }
        return itemArray
    }


    /**
     * 
     * @param {number} costLimit price limit
     * @param {number} quantity items to draw
     * @param {string} itemType string of the item type to draw from
     * @param {string} packs pack keys to draw from
     * @returns 
     */
    static async randomItemToChat(costLimit, quantity, itemType, packs) {
        let content = "Bag of Hoarding Loot Generation:<br>"
        let itemArray = await BoH.randomItem(costLimit, quantity, itemType, packs)
        if (!itemArray) return
        content += itemArray.reduce((a, v) => a += `@Compendium[${v.pack}.${v.id}]{${v.name}}<br>`, "")

        ChatMessage.create({
            content: content,
            whisper: [game.user.id]
        })
    }

    /**
     * 
     * @param {number} costLimit price limit
     * @param {number} quantity items to draw
     * @param {Array} tokenArray array of tokens 
     * @param {string} itemType string of the item type to draw from
     * @param {string} packs pack keys to draw from
     * @returns 
     */
    static async randomItemToActor(costLimit, quantity, tokenArray, itemType, packs) {
        if (!Array.isArray(tokenArray)) tokenArray = [tokenArray]
        for (let token of tokenArray) {
            let itemArray = await BoH.randomItem(costLimit, quantity, itemType, packs)
            if (!itemArray) return
            let dataArray = itemArray.map(i => i.data)
            token.actor.createEmbeddedDocuments("Item", dataArray)
        }
    }

    static getRandomInt(max) {
        return Math.floor(Math.random() * max);
    }

    static compendiumSelector() {
        let confirmed = false;
        let packs = game.packs.filter(p => (game.user.isGM || !p.private) && p.entity === "Item");
        let dialog_content = `
            <p>Choose Compendium</p>
            <div class = "form-group">
                <label>Select the Compendium to draw items from</label>
                <form>
                `;
        for (let pack of packs) {
            dialog_content += `<input type="checkbox" value="${pack.collection}">${pack.metadata.label}</input><br>`;
        }
        dialog_content += `</form></div>`;

        new Dialog({
            title: ``,
            content: dialog_content,
            buttons:
            {
                one:
                {
                    icon: `<i class="fas fa-check"></i>`,
                    label: "Continue",
                    callback: () => confirmed = true
                },
                two:
                {
                    icon: `<i class="fas fa-times"></i>`,
                    label: "Cancel",
                    callback: () => confirmed = false
                }
            },
            default: "Cancel",
            close: html => {
                if (confirmed) {
                    let boxes = Array.from(html.find("input[type='checkbox']:checked"))
                    let array = boxes.map(i => i.value)
                    BoH.selectionDialog(array);
                }
            }
        }).render(true);
    }

    static selectionDialog(ids) {
        new Dialog({
            title: `Draw Item Selection`,
            content: `
            <form>
            <div class="form-group">
            <label> Number of Items:</label>
                <input id="num" name="num" type="number"></input>
            </div>
            <div class="form-group">
            <label>Max Cost of Items:</label>
                <input id="cost" name="cost" type="number"></input>
            </div>
            <div class="form-group">
                <label>Type</label>
                <div class="form-fields">
                    <select name="type">
                        <option value="" selected="">Any</option>
                        <option value="weapon" selected="">Weapon</option>
                        <option value="equipment">Equipment</option>
                        <option value="consumable">Consumable</option>
                        <option value="tool">Tool</option>
                        <option value="loot">Loot</option>
                        <option value="class">Class</option>
                        <option value="spell">Spell</option>
                        <option value="feat">Feature</option>
                        <option value="backpack">Backpack</option>
                    </select>
                </div>
            </div>
            </form>
            `,
            buttons: {
                one: {
                    label: "Draw to Chat",
                    callback: (html) => {
                        let number = Number(html.find("#num")[0].value);
                        let cost = Number(html.find("#cost")[0].value);
                        let type = html.find("select[name='type']")[0].value
                        BoH.randomItemToChat(cost, number, type, ids)
                    }
                },
                two: {
                    label: "Draw to Token",
                    callback: (html) => {
                        let number = Number(html.find("#num")[0].value);
                        let cost = Number(html.find("#cost")[0].value);
                        let type = html.find("select[name='type']")[0].value
                        BoH.randomItemToActor(cost, number, canvas.tokens.controlled, type, ids)
                    }
                }
            }
        }).render(true)
    }

    static getSceneControlButtons(buttons) {
        let tokenButton = buttons.find(b => b.name == "token")
        if (tokenButton) {
            tokenButton.tools.push({
                name: "BoH-Gen",
                title: "Generate Loot",
                icon: "fas fa-gem",
                visible: game.user.isGm,
                onClick: () => BoH.compendiumSelector(),
                button: true
            });
        }
    }
}

Hooks.on('getSceneControlButtons', BoH.getSceneControlButtons)


