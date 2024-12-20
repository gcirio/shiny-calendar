from pathlib import PurePath
from htmltools import HTMLDependency, Tag
from shiny import ui
from shiny.module import resolve_id
from shiny.render.renderer import Jsonifiable, Renderer

shiny_calendar_deps = HTMLDependency(
    "shiny-calendar",
    "0.1.1",
    source={
        "package": "shiny_calendar",
        "subdir": str(PurePath(__file__).parent / "distjs"),
    },
    script={"src": "index.js", "type": "module"},
)


class render_shiny_calendar(Renderer):
    def auto_output_ui(self) -> Tag:
        return shiny_calendar(self.output_id)

    async def transform(self, value: []) -> Jsonifiable:
        """
        Transform a list into a JSONifiable object that can be
        passed to the calendar HTML dependency.
        """
        if not isinstance(value, list):
            raise TypeError(f"Expected a list, got {type(value)}. ")

        return value


def shiny_calendar(id: str, height: str = "600px"):
    return ui.div(
        shiny_calendar_deps,
        id=resolve_id(id),
        class_="shiny-calendar",
        style=f"height: {height}",
    )


async def shiny_calendar_call_js_func(session, id: str, js_func: str):
    await session.send_custom_message("shiny-calendar", {"id": id, "func": js_func})
