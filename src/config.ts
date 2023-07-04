export const tokenConfig = {
    maxRemainingToken: 5, // A modelben ez határozza meg a default értéket, illetve a kódbeli ellenőrzéseknél is ez adja meg a maximum tokent
    createAntiflood: { //Token generálásnál konfigurálható és ki/be kapcsolható globális antiflood
        state: true,
        timeInMS: 250,
        availableToUse: function (lastTime: number) { return (Date.now() - lastTime) > this.timeInMS }
    },
}

export const articleConfig = {
    maxLength: {
        title: 100,
        description: 5000
    }
}