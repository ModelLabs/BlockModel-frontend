<template>
  <div id="app">
    <GlobalHeader />
    <main class="main">
      <Fade>
        <router-view></router-view>
      </Fade>
    </main>
  </div>
</template>

<script>
import Fade from "./components/Base/Fade";
import GlobalHeader from "./common/GlobalHeader";
export default {
  name: "App",
  components: {
    Fade,
    GlobalHeader,
  },
};
</script>

<style lang="scss">
@import url('https://fonts.googleapis.com/css2?family=Miriam+Libre&display=swap');
html,
body,
p {
  margin: 0;
  border: 0;
  padding: 0;
}
html,body,#app {
  height: 100%;
  //background-color: black;
  background: -webkit-linear-gradient(top, rgba(184, 238, 248, 0.33), rgba(154, 126, 236, 0.22));
  overflow: scroll;
}
body {
  //overflow: scroll;
  //background: -webkit-linear-gradient(top, rgba(184, 238, 248, 0.63), rgba(154, 126, 236, 0.42));
}
#app {
  font-family: 'Miriam Libre', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  //color:white
}
.icon {
  width: 1.15em;
  height: 1.15em;
  vertical-align: -0.15em;
  fill: currentColor;
  overflow: hidden;
}
</style>
