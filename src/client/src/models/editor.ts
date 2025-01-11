import { useEditorContext } from "../stores";
import { MutableSkin } from "./skin";

export class Editor {

    skins: Array<MutableSkin>;
    activeSkinIndex: number;

    constructor() {
        this.skins = [];
        this.activeSkinIndex = 0;
    }

    static fromJSON(json: any): Editor {
        const editor = new Editor();
        editor.skins = json.skins.map((it: any) => MutableSkin.fromJSON(it));
        editor.activeSkinIndex = json.activeSkinIndex;
        return editor;
    }

    toJSON(): any {
        return {
            skins: this.skins.map(it => it.toJSON()),
            activeSkinIndex: this.activeSkinIndex
        };
    }

    get activeSkin(): MutableSkin | undefined {
        if (this.skins.length == 0) return undefined;
        return this.skins[this.activeSkinIndex];
    }

    get isSkinOpen(): boolean {
        return this.skins.length != 0;
    }

    addSkin(skin: MutableSkin) {
        this.skins.push(skin);
        this.activeSkinIndex = this.skins.length - 1;
        this.update();
    }

    removeSkin(skin: MutableSkin) {
        const index = this.skins.indexOf(skin);
        if (index == this.activeSkinIndex) this.activeSkinIndex = 0;
        this.skins.splice(index, 1);
    }

    setActiveSkin(index: number) {
        this.activeSkinIndex = index;
        this.update();
    }

    update() {
        useEditorContext.getState().setEditors(useEditorContext.getState().editors);
    }

}