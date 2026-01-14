export interface DocumentationDivider {
    component: object;
    header?: string;
}

export interface DocumentationMultiple<CONTENT_TYPE> {
    component: object;
    header?: string;
    content?: CONTENT_TYPE;
}

export interface DocumentationSectionPanel<CONTENT_TYPE> extends DocumentationMultiple<CONTENT_TYPE> {
    component: object;
    panelState: boolean;
    isOnlyForPro: boolean;
    supportedParams?: DocumentationMultiple<string>[];
}

export interface DocumentationSectionText extends Partial<DocumentationMultiple<string>> {
    component: object;
}
