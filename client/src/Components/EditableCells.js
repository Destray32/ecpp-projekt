import React, { useEffect, useRef } from "react";
import { Form, Select } from 'antd';

const { Option } = Select;

const EditableCell = ({
    title,
    editable,
    children,
    selectOptions = [],
    record,
    onSave,
    ...restProps
}) => {
    const [form] = Form.useForm();
    const inputRef = useRef(null);

    const handleChange = value => {
        form.setFieldsValue({ [title]: value });
    };

    const handleSave = async () => {
        try {
            const updatedValue = form.getFieldValue(title);
            await onSave(record.id, title, updatedValue);
        } catch (error) {
            console.error('Save failed:', error);
        }
    };

    useEffect(() => {
        form.setFieldsValue({ [title]: children });
    }, [children, title, form]);

    return (
        <td {...restProps}>
            {editable ? (
                <Form form={form} initialValues={{ [title]: children }}>
                    <Form.Item
                        style={{ margin: 0 }}
                        name={title}
                        rules={[{ required: true, message: `${title} is required.` }]}
                        className="min-w-36"
                    >
                        <Select
                            ref={inputRef}
                            onChange={handleChange}
                            onBlur={handleSave}
                        >
                            {selectOptions.map(option => (
                                <Option key={option.id} value={option.id}>
                                    {option.name}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>
                </Form>
            ) : (
                children
            )}
        </td>
    );
};

export default EditableCell;
