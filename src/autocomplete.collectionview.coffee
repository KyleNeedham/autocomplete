
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
      style: 'width: 100%;'

    ###*
     * @return {Marionette.ItemView}
    ###
    emptyView:
      Marionette.ItemView.extend
        tagName: 'li',
        template: _.template "<a>No suggestions available</a>"
