import * as React from "react";
import {observer} from "mobx-react";
import {SceneStore} from "../../stores/SceneStore";

interface NodeListProps {
    sceneStore: SceneStore;
    activeFolder: TreeElement|null;
}

@observer
export default class ActiveFolder extends React.Component<NodeListProps, any> {

    public render() {
        const {activeFolder, sceneStore} = this.props;

        if (activeFolder === null) {
            // TODO: "Error" is not the Way to go :-/
            return <div />;
        }

        const folderClass = activeFolder.id === sceneStore.selectedObjectId ? "current-selected" : "";
        const onClick = () => { sceneStore.selectedObjectId = activeFolder.id; };

        return (
            <div className="select-current-folder">
                <span className={folderClass} onClick={onClick}>
                    {activeFolder.name}
                </span>
            </div>
        );
    }
}