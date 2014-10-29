
  class AutoComplete.CollectionView extends Marionette.CollectionView

    ###*
     * @type {String}
    ###
    tagName: 'ul'

    ###*
     * @type {String}
    ###
    className: 'ac-suggestions dropdown-menu'

    emptyView:
    	Marionette.ItemView.extend
    		tagName: 'li',
    		template: _.template '<a href="#">No suggestions available</a>'