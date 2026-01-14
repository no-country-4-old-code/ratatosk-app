export interface RequestUserToken {
    token: string;
}

export interface RequestCancelPro extends RequestUserToken {
    setCanceled: boolean;
}

export interface RequestAddNewUser extends RequestUserToken {
    email: string;
}

export interface ResponseAddNewUser {
    success: boolean;
    msg?: string;
    project?: string;
}


export type RequestRunAsyncScan = RequestUserToken

export interface ResponseRunAsyncScan {
    success: boolean;
    msg: string;
}
