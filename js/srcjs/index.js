import { Calendar } from "fullcalendar"

// Wrap all definition in a check for the presence of Shiny. This allows the JS
// to be loaded outside without causing errors.
if (Shiny) {

  /* to keep track of the instances so that we can route the custom message to the correct instance
   * see: https://github.com/Appsilon/shiny-for-python-drawflow/blob/main/drawflow/drawflowComponent.js */
  const calendarMap = new Map();

  class ShinyCalendarOutputBinding extends Shiny.OutputBinding {
    /* Find the element that will be rendered by this output binding. */
    find(scope) {
      return scope.find(".shiny-calendar");
    }

    /* Function to run when rendering the output. */
    renderValue(el, payload) {

      // Iterate through the payload, and replace flagged handlers with the actual callback we want
      for (let key in payload[0]) {
        switch (key) {
          case "eventClick":
            payload[0][key] = function(info) { Shiny.setInputValue(el.id, {type: "eventClick", data: info}); }
            break;
          case 'dateClick':
            payload[0][key] = function(info) { Shiny.setInputValue(el.id, {type: "dateClick", data: info}); }
            break;
          case 'select':
            payload[0][key] = function(info) { Shiny.setInputValue(el.id, {type: "select", data: info}); }
            break;
          case 'unselect':
            payload[0][key] = function(info) { Shiny.setInputValue(el.id, {type: "unselect", data: info}); }
            break;
          case 'eventAdd':
            payload[0][key] = function(info) { Shiny.setInputValue(el.id, {type: "eventAdd", data: info}); }
            break;
          case 'eventChange':
            payload[0][key] = function(info) { Shiny.setInputValue(el.id, {type: "eventChange", data: info}); }
            break;
          case 'eventRemove':
            payload[0][key] = function(info) { Shiny.setInputValue(el.id, {type: "eventRemove", data: info}); }
            break;
          case 'eventsSet':
            payload[0][key] = function(info) { Shiny.setInputValue(el.id, {type: "eventsSet", data: info}); }
            break;
        }
      }

      const calendar = new Calendar(el, payload[0])
      calendarMap.set(el.id, calendar);
      calendar.render()
    }
  }

  /* Register the binding */
  Shiny.outputBindings.register(
    new ShinyCalendarOutputBinding(),
    "shiny-calendar"
  );

  /* Handle custom messages (server (python) -> client (js) messages) */
  Shiny.addCustomMessageHandler(
    "shiny-calendar",
    function(message) {
      const calendar = calendarMap.get(message.id);
      if(calendar === undefined) {
        console.error("calendar id \"" + message.id + "\" not found while handling shiny-calendar custom message.")
        return;
      }
      var tmpFunc = new Function("calendar", message.func);
      tmpFunc(calendar);
    }
  );
}
