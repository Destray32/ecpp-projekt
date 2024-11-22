import React, { useEffect, useRef } from "react";
import { Form, Select } from "antd";

const { Option } = Select;

const EditableCell = ({
    title,
    editable,
    isAdmin,
    children,
    selectOptions = [],
    record,
    onSave,
    ...restProps
}) => {
    const [form] = Form.useForm();
    const inputRef = useRef(null);

    const handleChange = (value) => {
        form.setFieldsValue({ [title]: value });
    };

    const handleSave = async () => {
        try {
            const updatedValue = form.getFieldValue(title);
            // If `-- Brak --` is selected, pass `null` to the save function.
            const valueToSave = updatedValue === "-- Brak --" ? null : updatedValue;
            await onSave(record.id, title, valueToSave);
        } catch (error) {
            console.error("Save failed:", error);
        }
    };

    useEffect(() => {
        form.setFieldsValue({ [title]: children });
    }, [children, title, form]);

    const displayValue = () => {
        const option = selectOptions.find((opt) => opt.id === children);
        return option ? option.name : children;
    };

    return (
        <td {...restProps}>
            {editable && isAdmin ? (
                <Form form={form} initialValues={{ [title]: children }}>
                    <Form.Item
                        style={{ margin: 0 }}
                        name={title}
                        rules={[
                            { required: true, message: `${title} is required.` },
                        ]}
                        className="min-w-36"
                    >
                        <Select
                            ref={inputRef}
                            onChange={handleChange}
                            onSelect={handleSave}
                        >
                            <Option key="null" value="-- Brak --">
                                -- Brak --
                            </Option>
                            {selectOptions.map((option) => (
                                <Option key={option.id} value={option.id}>
                                    {option.name}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>
                </Form>
            ) : (
                displayValue()
            )}
        </td>
    );
};

export default EditableCell;