import { useParams } from "react-router-dom";
import BlockLeaveSection from "./BlockLeaveSection";

export default function ManageBlockLeave() {
    const { employeeId } = useParams();
    return (
        <div className="w-full mt-2">
            <BlockLeaveSection employeeId={employeeId} />
        </div>
    );
}