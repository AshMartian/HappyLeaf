import Ember from 'ember';
import { storageFor } from 'ember-local-storage';

export default Ember.Component.extend({
  widgets: storageFor('widgets'),
  tagName: "md-content",
  classNames: ["content"],
  classNameBindings: ['homeLocked:locked:editing'],
  homeLocked: false,
  tempHide: true,

  activeWidgets: [],
  activeWidgetsIndex: 0,

  gridWidth: 10,

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
    if(!this.get('homeLocked')) {
      setTimeout(checkGrid, 500);
    }
    let tempWidgets = this.get('widgets');
    tempWidgets.replace(this.get('activeWidgetsIndex'), this.get('activeWidgets'));
    this.set('widgets', tempWidgets);
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
    
  },

  willRender() {
    this._super();
    
  },

  setGridsize() { //Default first set of widgets, then use 1, 2 for phone sizes
      let activeIndex = 0;
      if(window.innerWidth < 460) {
        activeIndex = 2;
        this.set('gridWidth', 3);
      } else if(window.innerWidth < 768) {
        activeIndex = 1;
        this.set('gridWidth', 6);
      } else {
        activeIndex = 0;
        this.set('gridWidth', 10);
      }
      this.set('activeWidgetIndex', activeIndex);
      this.set('activeWidgets', this.get('widgets').objectAt(activeIndex));
      this.set('tempHide', true);
      setTimeout(() => {
        this.set('tempHide', false);
      }, 5);
      //this.rerender();
  },

  didInsertElement() {
    $('.grid-stack').addTouch();
    $('.grid-stack').css("touch-action", "none");

    //console.log("Initiated content", this.set('activeWidgets'), this.get('widgets').objectAt(0), this.$().width());
    
    this.setGridsize();
    
    //console.log("And again", this.get('activeWidgets'));

    this.get('resizeService').on('didResize', event => {
      this.setGridsize();
    });
  },

  saveGrid(){
    $('.grid-stack .grid-stack-item:visible').each((el) => {
      el = $(el);
      let node = el.data('_gridstack_node');
      let id = parseInt(el.attr('data-gs-id'));
      if(id) {
        var currentWidget = this.get('activeWidgets').objectAt(id);
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
      if(items) {
        items.forEach((item) => {
          if(typeof item.id == 'string') {
            var currentWidget = this.get('activeWidgets').objectAt(parseInt(item.id));
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
