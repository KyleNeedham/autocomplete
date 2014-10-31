
  class AutoComplete.CollectionView extends Marionette.CollectionView

    ###*
     * @type {String}
    ###
    tagName: 'ul'

    ###*
     * @type {String}
    ###
    className: 'ac-suggestions dropdown-menu'

    ###*
     * @type {Marionette.ItemView}
    ###
    emptyView:
      Marionette.ItemView.extend
        tagName: 'li',
        template: _.template '<a href="#">No suggestions available</a>'