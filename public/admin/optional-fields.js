/* Optional controls omit blank values so JSON stays compatible with the domain validators. */
(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root.CMS && root.createClass && root.h) api.register(root.CMS, root.createClass, root.h, root.Immutable);
})(typeof window === "undefined" ? globalThis : window, function () {
  function optionalString(value) {
    return typeof value !== "string" || value.trim() === "" ? undefined : value;
  }
  function optionalNumber(value) {
    if (value === "" || value === undefined || value === null) return undefined;
    const number = Number(value);
    return Number.isFinite(number) && number > 0 ? number : value;
  }
  function optionalDateTime(value) {
    if (!value) return undefined;
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return value;
    return parsed.toISOString();
  }
  function optionalImage(value) {
    const source = value && typeof value.get === "function" ? value.toJS() : value;
    if (!source || typeof source !== "object") return undefined;
    const image = {};
    for (const key of ["src", "alt"]) {
      const field = optionalString(source[key]);
      if (field !== undefined) image[key] = field;
    }
    for (const key of ["width", "height"]) {
      const field = optionalNumber(source[key]);
      if (field !== undefined) image[key] = field;
    }
    return Object.keys(image).length ? image : undefined;
  }
  function register(CMS, createClass, h, Immutable) {
    const textControl = (tag, name) => createClass({
      handleChange(event) { this.props.onChange(optionalString(event.target.value)); },
      render() {
        return h(tag, {
          id: this.props.forID,
          className: this.props.classNameWrapper,
          value: this.props.value || "",
          onChange: this.handleChange,
          rows: tag === "textarea" ? 5 : undefined,
          type: tag === "input" ? "text" : undefined,
          "aria-label": name,
        });
      },
    });
    CMS.registerWidget("optional-string", textControl("input", "Optional text"));
    CMS.registerWidget("optional-text", textControl("textarea", "Optional text"));
    CMS.registerWidget("optional-number", createClass({
      handleChange(event) { this.props.onChange(optionalNumber(event.target.value)); },
      render() { return h("input", { id: this.props.forID, className: this.props.classNameWrapper, type: "number", min: 1, value: this.props.value ?? "", onChange: this.handleChange, "aria-label": "Optional positive number" }); },
      isValid() { return this.props.value === undefined || (Number.isFinite(Number(this.props.value)) && Number(this.props.value) > 0); },
    }));
    CMS.registerWidget("optional-datetime", createClass({
      handleChange(event) { this.props.onChange(optionalDateTime(event.target.value)); },
      render() {
        const value = this.props.value ? new Date(Date.parse(this.props.value) - new Date(this.props.value).getTimezoneOffset() * 60000).toISOString().slice(0, 16) : "";
        return h("input", { id: this.props.forID, className: this.props.classNameWrapper, type: "datetime-local", value, onChange: this.handleChange, "aria-label": "Optional date and time" });
      },
    }));
    CMS.registerWidget("optional-image-asset", createClass({
      setField(key, raw) {
        const current = optionalImage(this.props.value) || {};
        const next = { ...current };
        if (key === "src" || key === "alt") next[key] = optionalString(raw);
        else next[key] = optionalNumber(raw);
        Object.keys(next).forEach((name) => next[name] === undefined && delete next[name]);
        const value = Object.keys(next).length ? (Immutable ? Immutable.fromJS(next) : next) : undefined;
        this.props.onChange(value);
      },
      render() {
        const current = optionalImage(this.props.value) || {};
        const input = (key, label, type) => h("label", { key }, [label, h("input", {
          type,
          value: current[key] ?? "",
          min: type === "number" ? 1 : undefined,
          onChange: (event) => this.setField(key, event.target.value),
        })]);
        return h("fieldset", { id: this.props.forID, className: this.props.classNameWrapper }, [
          h("legend", null, "Optional image asset (leave blank to omit)"),
          input("src", "Source path or URL", "text"), input("alt", "Alternative text", "text"),
          input("width", "Width in pixels", "number"), input("height", "Height in pixels", "number"),
        ]);
      },
      isValid() {
        const image = optionalImage(this.props.value);
        return image === undefined || (typeof image.src === "string" && typeof image.alt === "string"
          && image.src.trim() !== "" && image.alt.trim() !== ""
          && ["width", "height"].every((key) => image[key] === undefined || (Number.isFinite(image[key]) && image[key] > 0)));
      },
    }));
  }
  return { optionalString, optionalNumber, optionalDateTime, optionalImage, register };
});
