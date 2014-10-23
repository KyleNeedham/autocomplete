
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
     * @type {AutoCompleteChildView}
    ###
    childView: AutoComplete.ChildView

    ###*
     * Setup CollectionView
     * 
     * @param {Object} options
    ###
    initialize: (options) ->
