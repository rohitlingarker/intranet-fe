import React from "react";
import Button from "../../../components/Button/Button";
import { Fonts } from "../../../components/Fonts/Fonts";

const ActionButtons = ({ onRequestLeave, onRequestCompOff }) => {
  return (
    <div className="flex flex-col sm:flex-row gap-2">
      <Button
        onClick={onRequestLeave}
        variant="primary"
        size="small"
      >
        Request Leave
      </Button>

      <Button
        onClick={onRequestCompOff}
        variant="secondary"
        size="small"
      >
        Request Credit for Compensatory Off
      </Button>

      {/* <a href="#" className={Fonts.link}>Leave Policy Explanation</a> */}

      {/* <Button
        variant="link"
        size="small"
      >
        Leave Policy Explanation
      </Button> */}
    </div>
  );
};

export default ActionButtons;