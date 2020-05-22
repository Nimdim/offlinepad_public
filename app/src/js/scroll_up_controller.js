import Backbone from "backbone";
import _ from "lodash";

class ScrollUpController {
  constructor() {
    _.extend(this, Backbone.Events);
    this.show = false;
    this.scrol = null;
    this.direction = null;
    this.last_scroll = null;
  }

  set_show(show) {
    this.show = show;
    this.trigger("show", show);
  }

  process(scroll) {
    if(this.direction == "to_up") {
      this.direction = "down";
      this.last_scroll = scroll;
      this.set_show(false);
      return;
    }

    if(this.scroll == null) {
      this.scroll = scroll;
      this.last_scroll = scroll;
    }
    let delta = scroll - this.last_scroll;
    this.last_scroll = scroll;

    let direction = this.direction;
    if(delta < 0) {
      direction = "up";
    }
    if(delta > 0) {
      direction = "down";
    }

    if(this.direction != direction) {
      this.direction = direction;
      this.scroll = scroll;
      this.set_show(false);
    }
    if(this.direction == "up") {
      let all_delta = scroll - this.scroll;
      if(Math.abs(all_delta) > 100) {
        this.set_show(true);
      }
    }
    if(scroll == 0) {
      this.set_show(false);
    }
  }

  scroll_top() {
    this.direction = "to_up";
  }
}

export default ScrollUpController;
