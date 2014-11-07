
  class AutoComplete.ChildView extends Marionette.ItemView

    ###*
     * @type {String}
    ###
    tagName: 'li'
    
    ###*
     * @type {String}
    ###
    className: 'ac-suggestion'

    ###*
     * @type {String}
    ###
    template: _.template '<a href="#"><%= value %></a>'

    ###*
     * @type {Object}
    ###
    events:
      'click': 'select'

    ###*
     * @type {Object}
    ###
    modelEvents:
      'highlight': 'highlight'
      'highlight:remove': 'removeHighlight'

    ###*
     * Make suggestion active
    ###
    highlight: ->
      @$el.addClass 'active'

    ###*
     * Remove suggestion highlight
    ###
    removeHighlight: ->
      @$el.removeClass 'active'

    ###*
     * Make the model active
    ###
    select: (e) ->
      e.preventDefault()
      @model.trigger 'selected', @model