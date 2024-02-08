export const changeEyeShowing = (index: number) => {
    let tmp = [];

    const passowrd_field = document.getElementById('password');
    if (index == 0) {
        tmp[0] = false;
        tmp[1] = true;
        passowrd_field?.setAttribute('type', 'password');
    } else {
        tmp[0] = true;
        tmp[1] = false;
        passowrd_field?.setAttribute('type', '');
    }

    return tmp;
}


