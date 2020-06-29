
export default {
  vibrate: function(type) {
      if(window.navigator.vibrate == null) {
        return;
      }
      let pattern;
      switch(type) {
        case "button":
          pattern = 100;
          break;
        case "error":
          pattern = [100, 100, 100];
          break;
        default:
          throw new Error("unknown vibrate pattern");
      }
      window.navigator.vibrate(pattern);
    }
};
