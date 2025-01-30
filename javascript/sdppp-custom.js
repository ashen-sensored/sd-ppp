/**
 * outputType: the type of the widget
 * outputType: 控件的类型
 * supported types:
 * 支持的类型：
 * toggle: 勾选框
 * number: 数字
 * string: 字符串
 * combo: 下拉框
 * IMAGE_PATH: 图片路径
 * MASK_PATH: 遮罩路径
 * PS_DOCUMENT: Photoshop 文档
 * PS_LAYER: Photoshop 图层
 * 
 * 
 * tips: How to control the space of widgets and line breaks
 * Each line can contain 12 uiWeight widgets, if it exceeds, it will break the line
 * For example, if there are two widgets with uiWeight of 8 and 4, they will occupy one line, occupying two-thirds and one-third of the space respectively
 * If there are three widgets with uiWeight of 4, 4, and 4, they will share the space of one line equally
 * The default uiWeight of each widget is 12, which means they will occupy one line by default
 * 
 * tips: 如何控制控件的占用空间、换行
 * 每一行，能容纳下uiWeight总和为12的控件，如果超了就会换行
 * 比如PrimitiveNumber有两个控件，uiWeight分别为8和4，那么这两个控件就会占用一行，分别占用三分之二和三分之一的空间
 * 如果有三个控件，uiWeight分别为4、4、4，那么它们就会等分一行的空间
 * 默认情况下控件的uiWidget就是12，代表它们默认就会占用一行。
 */


export default function(sdppp) {
    /**
     * Handle SDPPP Get Document
     * 处理 SDPPP Get Document
     * 
     * only keep the first widget, set the output type to DOCUMENT
     * 只保留第一个控件, 将输出类型设置为 DOCUMENT
     */
    sdppp.widgetable.add('SDPPP Get Document', (node) => {
        return {
            title: node.title,
            widgets: [{
                value: node.widgets[0].value,
                outputType: "PS_DOCUMENT"
            }]
        }
    })
    /**
     * Handle SDPPP Get Layer By ID
     * 处理 SDPPP Get Layer By ID
     * 
     * only keep the first widget, set the output type to LAYER
     * 只保留第一个控件, 将输出类型设置为 LAYER
     */
    sdppp.widgetable.add('SDPPP Get Layer By ID', (node) => {

        return {
            title: node.title,
            widgets: [{
                value: node.widgets[0].value,
                outputType: "PS_LAYER",
                options: {
                    documentNodeID: sdppp.findDocumentNodeRecursive(node)?.id || 0
                }
            }]
        }
    })
    /**
     * Handle PrimitiveNode
     * 处理 PrimitiveNode
     * 
     * first use the name of the connected output as title, if not connected then use the node title
     * 首先标题优先使用它所连接的输出的名称，如果没有连接就使用节点的标题
     * 
     * Then, if there are multiple widgets, only keep the first two
     * 其次，如果有多个控件，则只保留前两个控件。
     * 
     * If the first widget is a number type and suitable for dragging, only keep the first widget
     * 如果第一个控件是数字类型且适用拖动控件，则只保留第一个控件
     */
    sdppp.widgetable.add('PrimitiveNode', (node) => {
        let title = node.title.startsWith("Primitive") ? nameByTitleOrConnectedOutput(node) : node.title;
        if (!node.widgets || node.widgets.length == 0) {
            return null;
        }
        let widgets = node.widgets.slice(0, 2)
            .map((widget, index) => ({
                value: widget.value,
                name: widget.label || widget.name,
                outputType: widget.type || "string",
                options: widget.options,
                uiWeight: index == 0 ? 2 : 0.8
            }))
        if (widgets[0].outputType == "number") {
            let isStepRangeTooBig = ((widgets[0].options.max - widgets[0].options.min) / widgets[0].options.step) > 1000;
            if (!isStepRangeTooBig) {
                widgets = widgets.slice(0, 1);
            }
        }
        return {
            title,
            widgets
        }
    })
    /**
     * Handle rgthree nodes
     * 处理 rgthree 系列节点
     * 
     * FastMute nodes only have one checkbox, so we can omit the widget name
     * FastMute节点只有一个勾选框，所以可以不保留控件名字
     */
    sdppp.widgetable.add('*rgthree*', (node) => {
        return {
            title: node.title,
            widgets: node.widgets.map((widget) => ({
                value: widget.value,
                name: '',
                outputType: widget.type || "toggle",
                options: widget.options
            }))
        }
    })
    /**
     * Handle LoadImage
     * 处理 LoadImage 节点
     * 
     */
    sdppp.widgetable.add('LoadImage', (node) => {
        return {
            title: node.title,
            widgets: [{
                value: node.widgets[0].value,
                outputType: "IMAGE_PATH"
            }]
        }
    })
    /**
     * Handle LoadImageMask
     * 处理 LoadImageMask
     * 
     */
    sdppp.widgetable.add('LoadImageMask', (node) => {
        return {
            title: node.title,
            widgets: [{
                value: node.widgets[0].value,
                outputType: "MASK_PATH"
            }]
        }
    })
}


/**
 * get the name of the input where this node is connected to, or the title of the node if not connected
 * 获取到这个节点连接的输入的名称，或者如果没有连接就返回节点的标题
 * 
 * @param {*} node 
 * @returns 
 */
function nameByTitleOrConnectedOutput(node) {
    return node.outputs?.[0].widget?.name || node.title;
}
