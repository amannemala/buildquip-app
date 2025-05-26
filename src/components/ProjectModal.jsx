import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const ProjectModal = ({ isOpen, onClose, onSave, project }) => {
    const [formData, setFormData] = useState({
        projectName: '',
        projectBreakdown: '',
    });

    useEffect(() => {
        if (project) {
            setFormData({
                projectName: project.projectName || '',
                projectBreakdown: project.projectBreakdown || '',
            });
        } else {
            setFormData({
                projectName: '',
                projectBreakdown: '',
            });
        }
    }, [project]);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg w-full max-w-md mx-4">
                <div className="flex items-center justify-between p-4 border-b">
                    <h2 className="text-xl font-semibold">
                        {project ? 'Edit Project' : 'Add New Project'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-4">
                    <div className="space-y-4">
                        <div>
                            <label
                                htmlFor="projectName"
                                className="block text-sm font-medium text-gray-700 mb-1"
                            >
                                Project Name
                            </label>
                            <input
                                type="text"
                                id="projectName"
                                value={formData.projectName}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        projectName: e.target.value,
                                    })
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="projectBreakdown"
                                className="block text-sm font-medium text-gray-700 mb-1"
                            >
                                Project Breakdown
                            </label>
                            <textarea
                                id="projectBreakdown"
                                value={formData.projectBreakdown}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        projectBreakdown: e.target.value,
                                    })
                                }
                                rows="4"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    <div className="mt-6 flex justify-end space-x-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            {project ? 'Save Changes' : 'Create Project'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProjectModal; 