export class OptionRenderer {
    static render(options) { return options.map(o => '<option value="' + o + '">' + o + '</option>').join(''); }
}
