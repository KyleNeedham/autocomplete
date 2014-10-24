
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
     * @type {AutoComplete.ChildView}
    ###
    childView: AutoComplete.ChildView
