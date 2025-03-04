import { redirect } from "react-router-dom";

export function action(){
    localStorage.removeItem('accessToken');
    return redirect('/');
}

//라우트 이용해서 본격적으로 사용 할 예정 