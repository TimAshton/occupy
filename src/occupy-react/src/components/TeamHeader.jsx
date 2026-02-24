export default function TeamHeader(props) {
    return (
        <div className="team-header {props.classString}">
            {props.teamName}
        </div>
    )
}