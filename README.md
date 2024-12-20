# shiny-calendar

[![PyPI](https://img.shields.io/pypi/v/shiny-calendar.svg)](https://pypi.org/project/shiny-calendar/)

Calendar component for Python Shiny using [FullCalendar](https://fullcalendar.io/).

### [Here for a live demo](https://gcirio.github.io/shiny-calendar/)

It currently supports:

- all configuration options and frontend interactions from FullCalendar
- server-side setup up of config, events and resources at init
- server-side reactivy for different interactions
- calling custom js functions from the server

TODO:

- allow css customizations
- eventually add methods to manipulate events from the server after init (instead of using custom js calls)

# Installation

You can install `shiny-calendar` using pip:

```python
pip install shiny-calendar
```

# Usage

## Setup and configuration

As for any Shiny component, there is a UI function (`shiny_calendar`) to declare the component in the UI, and a decorator (`@render_shiny_calendar`) to setup the component on the server side.

To configure the calendar, return a dictionnary from the decorated function with key/value pairs holding the configuration.

See [FullCalendar](https://fullcalendar.io/) documentation to set up configuration options, events and resources during calendar initialization.

The file `example_app.py` shows a simple example that sets up the calendar and an output text field that shows the data sent back from the frontend when interacting with the calendar.

Here is a snippet to give an idea:

```python
from shiny_calendar import shiny_calendar, render_shiny_calendar

# UI
app_ui = ui.page_fluid(
    shiny_calendar("my_calendar")
)

# server
def server(input, output, session):
    @render_shiny_calendar
    def my_calendar():
        return [
            {
                # react on event click
                "eventClick": "",
                "initialDate": "2023-07-01",
                "allDaySlot": True,
                "editable": True,
                "selectable": True,
                "initialView": "timeGridWeek",
                "events": [
                    {
                        "id": "id1_allday",
                        "title": "Event 1",
                        "start": "2023-07-03",
                        "end": "2023-07-05",
                    },
                    {
                        "id": "id7",
                        "title": "Event 7",
                        "start": "2023-07-01T08:30:00",
                        "end": "2023-07-01T10:30:00",
                    }
                ]
            }
        ]

```

## Reactivity

FullCalendar triggers [handlers](https://fullcalendar.io/docs/handlers) when interacting with the calendar.

`shiny-calendar` can react to those triggers like any other Shiny reactive component, i.e. by reading the reactive value on the server side:

```python
@render.text
def valueOut():
    return f"{input.my_calendar()}"

```

The reactive value (`input.my_calendar()` in the example above) holds the information returned by FullCalendar, which varies depending on the type of interaction (see the [handlers](https://fullcalendar.io/docs/handlers) documentation).

All FullCalendar interactions are available:

- [eventClick](https://fullcalendar.io/docs/eventClick)
- [dateClick](https://fullcalendar.io/docs/dateClick)
- [select](https://fullcalendar.io/docs/select)
- [unselect](https://fullcalendar.io/docs/unselect)
- [eventAdd](https://fullcalendar.io/docs/eventAdd)
- [eventChange](https://fullcalendar.io/docs/eventChange)
- [eventRemove](https://fullcalendar.io/docs/eventRemove)
- [eventsSet](https://fullcalendar.io/docs/eventsSet)


To let `shiny-calendar` know which ones to listen to, simply add the corresponding key to the configration (no matter the value).

For example, to activate `eventClick` and `select` interactions:

```python
"eventClick": "",
"select": "",
```

When an interaction triggers a server-side reaction, the reactive value holds the following data:

- `"type"`: the interaction type (`"eventClick"`, `"dateClick"`, etc)
- `"data"`: the data from FullCalendar for the particular event that triggered

See the `example_app.py` for more details.

## Javascript frontend calls

You can call custom javascript functions by using the `shiny_calendar_call_js_func` method from the server side.

This is allows to control control the calendar from the server side (through reactive effects, for example).
Use the `calendar` variable to access the correspodning FullCalendar javascript instance.

The following snippet adds an event when clicking on the `button_add_event` button:

```python
from shiny_calendar import shiny_calendar_call_js_func

@reactive.effect
@reactive.event(input.button_add_event)
async def _():
    js_func = (
        "calendar.addEvent({id: 'someId', title: 'some event title', start: '%s', end: '%s'});"
        % (date_start, date_end)
    )
    await shiny_calendar_call_js_func(session, "my_calendar", js_func)
```

And this snippet changes the color of an event to red when the event is selected:

```python
from shiny_calendar import shiny_calendar_call_js_func

@reactive.effect
async def _():
    msg = input.my_calendar()
    if msg["type"] == "eventClick":
        # if eventClick, set the border and background of then event to red
        # the proper way would be to use eventClassNames, this is just an example
        event_id = msg["data"]["event"]["id"]
        js_func = f"""
            const calEvent = calendar.getEventById("{event_id}");
            calEvent.setProp("backgroundColor", "red");
            calEvent.setProp("borderColor", "red");
            """
        await shiny_calendar_call_js_func(session, "my_calendar", js_func)
```

# Developing

This project uses [uv](https://github.com/astral-sh/uv) for dependency, package and project management, and 
[ruff](https://github.com/astral-sh/ruff) for code formatting.

## Setting up JS for development

Go to the javascript folder:

```sh
cd js
```

Install the dependencies for javascript:

```sh
npm install
```

Build assets into the `src/shiny_calendar/distjs` folder:

```sh
npm run build
```

Or if you want to watch the files for changes and rebuild on the fly you can run:

```sh
npm run watch
```

## Running the example app

```sh
uv run shiny run example-app/app.py
```

## Building the package

```sh
uv build
```

## Formatting as pre-commit check

For code formatting run the pre-commit checks:

```sh
pre-commit run --all-files
```

or install the pre-commit check as a pre-commit hook

```sh
pre-commit install
```


