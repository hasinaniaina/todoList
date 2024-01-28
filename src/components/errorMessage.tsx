
export default function ErrorMessage(props: {message: string, isError: boolean}) {
    return (
        <>
            <div className="alert alert-danger" role="alert" style={props.isError ? { display: 'block' } : { display: 'none' }}>
                <span className="font-medium">{props.message}</span>
            </div>
        </>
    )
}
