const app = Vue.createApp({
  data() {
    return {
      counter: 0,
    };
  },
  methods: {
    incy() {
      this.counter++;
    },
    decy() {
      this.counter--;
    },
    thing(evt) {
      console.log(evt)
    }
  }
});

app.mount('#events');
