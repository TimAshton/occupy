const app = Vue.createApp({
    data() {
        return {
            friends: [
                {
                    id: "tim", name: "Timmy"
                },
                {
                    id: "jo", name: "TOJO"
                }
            ]
        };
    }
});

app.component('sector-box', {
    template: `<div class="box"></div>`
});

app.mount("#app");