import {Link, useLocation} from 'react-router-dom';

export default function Breadcrumbs() {
    const location = useLocation();
    let currenctlink = '';

    const crumbs: any = location.pathname.split('/')
    .filter(crumb => crumb !== '')
    .map(crumb => {
        currenctlink += `/${crumb}`;

        return (
            <div className='crumb' key={crumb}>
                <Link to={currenctlink}>{crumb}</Link>
            </div>
        )
    })
    return (
        <>
            {crumbs}
        </>
    )
}
