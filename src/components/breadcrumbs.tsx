import { FormEvent } from 'react';
import {useLocation, useNavigate} from 'react-router-dom';

export default function Breadcrumbs() {
    const location = useLocation();
    const project_id = (location.state) ? location.state.id : null;
    const navigate   = useNavigate();
    // let currenctlink: Record<string, string> = {};

    const navigateTo = (e: FormEvent<HTMLAnchorElement>, crumb: string) => {
        e.preventDefault();
        if (crumb.includes('project')) {
            navigate('/project');
        } else {
            navigate('/project/Task', {state: {id: project_id}});
        }
    }

    const crumbs: any = location.pathname.split('/')
    .filter(crumb => crumb !== '')
    .map(crumb => {

        return (
            <div className='crumb' key={crumb}>
                <a href="" onClick={(e) => {navigateTo(e, crumb)}}>{crumb}</a>
            </div>
        )
    })
    return (
        <>
            {crumbs}
        </>
    )
}
