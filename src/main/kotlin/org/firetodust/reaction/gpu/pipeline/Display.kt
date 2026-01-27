package org.firetodust.reaction.gpu.pipeline

/**
 * Display node that renders to screen.
 * Triggers pipeline execution and presents the final frame.
 */
class Display(
    override val inputs: List<BufferNode<*>>
) : DisplayNode {

    /**
     * Triggers pipeline execution and displays to screen.
     *
     * Note: Actual rendering is done by RenderProcessor nodes in the graph.
     * This node just marks the end of the pipeline and triggers execution.
     * Pipeline class will handle execution orchestration.
     *
     * After all rendering commands are submitted, bgfx_frame() must be called
     * to present the frame (handled by Pipeline).
     */
    override fun display() {
        // Pipeline will coordinate execution
        // This is just a marker node
    }
}