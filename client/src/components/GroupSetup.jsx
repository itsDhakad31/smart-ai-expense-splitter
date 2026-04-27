import { useEffect, useRef, useState } from "react";

const INITIAL_MEMBERS = ["", ""];

function GroupSetup({
  isSubmitting,
  onCreateGroup,
  initialGroupName = "",
  initialMembers = INITIAL_MEMBERS,
  title = "Create your group",
  stepLabel = "Step 1",
  submitLabel = "Create group",
  helperText = "",
  onCancel
}) {
  const [groupName, setGroupName] = useState(initialGroupName);
  const [memberInputs, setMemberInputs] = useState(
    initialMembers.length ? initialMembers : INITIAL_MEMBERS
  );
  const [error, setError] = useState("");
  const previousSignatureRef = useRef("");

  useEffect(() => {
    const nextSignature = JSON.stringify({
      groupName: initialGroupName,
      members: initialMembers
    });

    if (previousSignatureRef.current === nextSignature) {
      return;
    }

    previousSignatureRef.current = nextSignature;
    setGroupName(initialGroupName);
    setMemberInputs(initialMembers.length ? initialMembers : INITIAL_MEMBERS);
    setError("");
  }, [initialGroupName, initialMembers]);

  function updateMember(index, value) {
    setMemberInputs((currentMembers) =>
      currentMembers.map((member, memberIndex) =>
        memberIndex === index ? value : member
      )
    );
  }

  function addMemberField() {
    setMemberInputs((currentMembers) => [...currentMembers, ""]);
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const members = memberInputs
      .map((member) => member.trim())
      .filter(Boolean);

    const uniqueMembers = Array.from(new Set(members.map((member) => member.toLowerCase())));

    if (!groupName.trim()) {
      setError("Please enter a group name.");
      return;
    }

    if (members.length < 2) {
      setError("Add at least two members.");
      return;
    }

    if (uniqueMembers.length !== members.length) {
      setError("Member names must be unique.");
      return;
    }

    setError("");
    await onCreateGroup({
      name: groupName.trim(),
      members
    });
  }

  return (
    <section className="panel form-panel">
      <div className="section-heading">
        <div>
          <p className="eyebrow">{stepLabel}</p>
          <h2>{title}</h2>
        </div>
      </div>

      <form className="stack-form" onSubmit={handleSubmit}>
        <label className="field">
          <span>Group name</span>
          <input
            type="text"
            placeholder="Weekend Trip"
            value={groupName}
            onChange={(event) => setGroupName(event.target.value)}
          />
        </label>

        <div className="field">
          <span>Members</span>
          <div className="member-list">
            {memberInputs.map((member, index) => (
              <input
                key={index}
                type="text"
                placeholder={`Member ${index + 1}`}
                value={member}
                onChange={(event) => updateMember(index, event.target.value)}
              />
            ))}
          </div>
          <button className="secondary-button" type="button" onClick={addMemberField}>
            Add another member
          </button>
        </div>

        {helperText ? <p className="form-helper">{helperText}</p> : null}
        {error ? <p className="form-error">{error}</p> : null}

        <div className="form-actions">
          {onCancel ? (
            <button className="secondary-button" type="button" onClick={onCancel}>
              Cancel
            </button>
          ) : null}

          <button className="primary-button" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving group..." : submitLabel}
          </button>
        </div>
      </form>
    </section>
  );
}

export default GroupSetup;
