
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
     * @type {Object}
    ###
    attributes:
      style: 'max-width: 100%; max-height: 300px; overflow: auto;'

    ###*
     * @type {Marionette.ItemView}
    ###
    emptyView:
      Marionette.ItemView.extend
        tagName: 'li',
        template: _.template '<a href="#">No suggestions available</a>'
