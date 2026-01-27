package org.firetodust.reaction.gpu.pipeline

import java.nio.ByteBuffer

/**
 * CPU readback target that retrieves computation results from GPU.
 * Triggers pipeline execution when compute() is called.
 */
class Target<T: Format>: TargetNode<T> {


    override fun execute() {
        val buffer = ByteBuffer.allocateDirect()
        TODO("Not yet implemented")
    }
}
