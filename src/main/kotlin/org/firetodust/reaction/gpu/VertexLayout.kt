package org.firetodust.reaction.gpu

import org.lwjgl.bgfx.BGFX
import org.lwjgl.bgfx.BGFXVertexLayout
import java.nio.ByteBuffer

interface VertexData {
    // Each vertex object knows how to write itself into a generic ByteBuffer
    fun put(buffer: ByteBuffer)
}

// Maps to BGFX_ATTRIB_...
enum class VertexAttributeTarget(val id: Int) {
    Position(BGFX.BGFX_ATTRIB_POSITION),
    Normal(BGFX.BGFX_ATTRIB_NORMAL),
    Tangent(BGFX.BGFX_ATTRIB_TANGENT),
    Bitangent(BGFX.BGFX_ATTRIB_BITANGENT),
    Color0(BGFX.BGFX_ATTRIB_COLOR0),
    Color1(BGFX.BGFX_ATTRIB_COLOR1),
    TexCoord0(BGFX.BGFX_ATTRIB_TEXCOORD0),
    TexCoord1(BGFX.BGFX_ATTRIB_TEXCOORD1)
    // Add others as needed
}

// Maps to BGFX_ATTRIB_TYPE_...
enum class VertexAttributeType(val id: Int) {
    Uint8(BGFX.BGFX_ATTRIB_TYPE_UINT8),
    Uint10(BGFX.BGFX_ATTRIB_TYPE_UINT10),
    Int16(BGFX.BGFX_ATTRIB_TYPE_INT16),
    Half(BGFX.BGFX_ATTRIB_TYPE_HALF),
    Float(BGFX.BGFX_ATTRIB_TYPE_FLOAT)
}
data class VertexAttribute(
    val target: VertexAttributeTarget,
    val type: VertexAttributeType,
    val isNormalized: Boolean,
    val asInt: Boolean,
    val dimensionCount: Int)

class VertexLayout{
    val attributes: MutableList<VertexAttribute> = mutableListOf()
    val nativeLayout: BGFXVertexLayout by lazy {
        BGFX.bgfx_vertex_layout_begin(nativeLayout, BGFX.bgfx_get_renderer_type())
        attributes.forEach { BGFX.bgfx_vertex_layout_add(
            nativeLayout,
            it.target.id,
            it.dimensionCount,
            it.type.id,
            it.isNormalized,
            it.asInt
        )}
        BGFX.bgfx_vertex_layout_end(nativeLayout)
        nativeLayout
    }

    // This function mimics the C API but uses our safe Enums
    fun add(
        target: VertexAttributeTarget,
        type: VertexAttributeType,
        isNormalized: Boolean,
        asInt: Boolean,
        dimensionCount: Int
    ) {
        attributes.add(VertexAttribute(target, type, isNormalized, asInt, dimensionCount))
    }
    operator plusAssign(other)

}

// This is a helper function to make the syntax pretty
fun createVertexLayout(block: VertexLayout.() -> Unit): VertexLayout {
    val layout = VertexLayout()
    layout.block() // Execute the user's code inside our builder context
    return layout
}