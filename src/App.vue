<template>
  <main id="app">
    <OrderRegistrationComponent />
  </main>
</template>

<script>
import OrderRegistrationComponent from './components/OrderRegistrationComponent'

export default {
  name: 'App',
  components: {
    OrderRegistrationComponent
  }
}
</script>

<style lang="scss">
#app {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  margin-top: 60px;
}
</style>
