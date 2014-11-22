
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
     * Make the element that relates the current model active.
    ###
    highlight: ->
      @$el.addClass 'active'

    ###*
     * Make the element that relates to the current model inactive.
    ###
    removeHighlight: ->
      @$el.removeClass 'active'

    ###*
     * Make the current model active so that the autocomplete behavior
     * can listen for this event and trigger its own selection event on the view.
    ###
    select: (e) ->
      e.preventDefault()
      @model.trigger 'selected', @model
