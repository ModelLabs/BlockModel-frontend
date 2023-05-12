<template>
  <div class="container">
    <div class="title"><span>Quick Guide Video</span></div>
    <div class="video">
      <iframe
        width="560"
        height="315"
        :src="videoUrl"
        frameborder="0"
        allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
        allowfullscreen
      ></iframe>
    </div>
  </div>
</template>
<script>
export default {
  data() {
    return {
      videoUrl: "https://www.youtube.com/embed/st8im-Fox6c",
    };
  },
  components: {
    
  },
  watch:{
    
  },
  methods: {
    
  },

  computed: {
    
  },

  mounted(){
    
  }
}
</script>

<style scoped lang="scss">
.container {
  margin: auto;
  .title {
    text-align: center;
    padding: 60px;
    span {
      font-size: 40px;
      font-weight: 600;
      background-image: linear-gradient(to bottom, #49e4f5, #d849f5);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
  }
  .video{
    left: 50%;
    top: 50%;
    position: absolute;
    transform: translate(-50%,-50%);
  }
}
</style>