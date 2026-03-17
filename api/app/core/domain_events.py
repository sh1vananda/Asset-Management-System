_event_listeners = {}


def register_event(event_name, func):
    if event_name not in _event_listeners:
        _event_listeners[event_name] = []

    _event_listeners[event_name].append(func)


def dispatch_event(event_name, data=None):
    listeners = _event_listeners.get(event_name, [])

    for listener in listeners:
        listener(data)