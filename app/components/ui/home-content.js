import Ember from 'ember';
import { storageFor } from 'ember-local-storage';

export default Ember.Component.extend({
  widgets: storageFor('widgets'),
  tagName: "md-content",
  classNames: ["grid-list-demo-responsiveTiles content"],
  homeLocked: false,
  tempHide: false,

  lockWidgets: function() {
    this.set('tempHide', true);
    console.log("Getting grid layout", this.$('.grid-stack').data('gridstack'));
    setTimeout(() => {
      this.set('tempHide', false);
    }, 5);

    var checkGrid = () => {
      if($('.grid-stack').length > 0) {
        $('.grid-stack').addTouch();
      } else {
        setTimeout(checkGrid, 500);
      }
    }
    if(!this.get('homeLocked')){
      setTimeout(checkGrid, 500);
    }
    /*var res = _.map($('.grid-stack .grid-stack-item:visible'), function (el) {
      el = $(el);
      var node = el.data('_gridstack_node');
      return {
          id: el.attr('data-gs-id'),
          x: node.x,
          y: node.y,
          width: node.width,
          height: node.height
      };
  });
  console.log(res);*/
  
  //this.rerender();
  }.observes('homeLocked'),

  updatedWidgets: function() {
    //console.log("Updated Widgets", this.get('widgets.content'))
    //this.rerender();
  }.observes('widgets.@each'),

  init() {
    this._super();
    console.log("Initiated content", this.get('widgets.content'));
  },

  didInsertElement() {
    $('.grid-stack').addTouch();
    $('.grid-stack').css("touch-action", "none");
  },

  saveGrid(){
    $('.grid-stack .grid-stack-item:visible').each((el) => {
      el = $(el);
      let node = el.data('_gridstack_node');
      let id = parseInt(el.attr('data-gs-id'));
      if(id) {
        var currentWidget = this.get('widgets').objectAt(id);
        if(currentWidget){
          if(currentWidget.grid.x !== node.x || currentWidget.grid.y !== node.y || currentWidget.grid.width !== node.width || currentWidget.grid.height !== node.height) {
            Ember.set(currentWidget, 'grid', {
              x: node.x,
              y: node.y,
              height: node.height,
              width: node.width,
              locked: node.locked
            });
            //console.log(currentWidget);
            //this.get('widgets').replace(parseInt(id), 1, Ember.Object.create(currentWidget));
          }
        }
      }
    });
  },

  actions: {
    gridEnabled() {
      //console.log("Drag stop", this.get('widgets'));
      $('.grid-stack').addTouch();
      $('.grid-stack').css("touch-action", "none");
    },
    dragStop() {
      //console.log("Drag stop", this.get('widgets'));
      this.saveGrid();
    },
    gridChange(e, items) {
      //console.log("Grid changed", items, this.get('widgets'));
      if(items){
        items.forEach((item) => {
          if(typeof item.id == 'string') {
            var currentWidget = this.get('widgets').objectAt(parseInt(item.id));
            if(currentWidget){
              if(currentWidget.grid.x !== item.x || currentWidget.grid.y !== item.y || currentWidget.grid.width !== item.width || currentWidget.grid.height !== item.height) {
                Ember.set(currentWidget, 'grid', {
                  x: item.x,
                  y: item.y,
                  height: item.height,
                  width: item.width,
                  locked: item.locked
                });
                //console.log(currentWidget);
                //this.get('widgets').replace(parseInt(item.id), 1, Ember.Object.create(currentWidget));
              }
            }
          }
        });
      }
    }
  }
});
