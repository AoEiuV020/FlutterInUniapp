package flutter

import android.content.Context
import android.util.Base64
import android.util.Log
import android.widget.FrameLayout
import androidx.fragment.app.FragmentActivity
import com.aoeiuv020.meeting_flutter.EventListener
import com.aoeiuv020.meeting_flutter.LivekitDemoFragment
import io.flutter.embedding.android.FlutterFragment.NewEngineFragmentBuilder
import io.flutter.embedding.android.RenderMode

/**
 * Flutter容器
 * 基于FrameLayout的自定义控件
 */
class FlutterFrameLayout(context: Context) : FrameLayout(context) {
    companion object {
        const val EVENT_JSON_RPC = "json-rpc-2.0"
    }

    private val TAG = "FlutterContainer"
    private lateinit var flutterFragment: LivekitDemoFragment
    private var handler: ((String) -> Unit)? = null

    fun sendJsonRpc(s: String) {
        post {
            flutterFragment.invokeMethod(EVENT_JSON_RPC, s, null)
        }
    }

    fun registerJsonRpc(callback: (String) -> Unit) {
        this.handler = callback
    }

    fun unregisterJsonRpc() {
        this.handler = null
    }

    init {
        Log.d(TAG, "初始化Flutter容器")
    }

    /**
     * 初始化Flutter Fragment
     */
    fun initFlutterFragment(optionsString: String) {
        // 直接强制使用FragmentActivity
        val activity = context as FragmentActivity

        try {
            // 使用固定的fragmentTag
            val fragmentTag = "flutter_fragment"
            val existingFragment = activity.supportFragmentManager.findFragmentByTag(fragmentTag)
            if (existingFragment != null && existingFragment is LivekitDemoFragment) {
                flutterFragment = existingFragment
            } else {
                // 如果不存在，则创建新的Fragment
                flutterFragment = NewEngineFragmentBuilder(LivekitDemoFragment::class.java)
                    .renderMode(RenderMode.texture)
                    .dartEntrypointArgs(
                        listOf(
                            "--jsonRpcMode",
                            "--keepWindowOpen",
                            "--livekitDemoOptions",
                            Base64.encodeToString(
                                optionsString.toByteArray(),
                                Base64.NO_WRAP
                            )
                        )
                    ).build()
            }
            flutterFragment.eventListener = object : EventListener {
                override fun onEvent(method: String, arguments: Any?): Any? {
                    if (method == EVENT_JSON_RPC) {
                        handler?.invoke(arguments as String)
                    }
                    return null
                }
            }

            // 确保FrameLayout有一个ID，否则Fragment无法添加
            if (id == NO_ID) {
                id = generateViewId()
            }

            val transaction = activity.supportFragmentManager.beginTransaction()
            transaction.replace(id, flutterFragment, fragmentTag)
            transaction.commit()
        } catch (e: Exception) {
            Log.e(TAG, "创建Fragment失败", e)
        }
    }

    override fun onAttachedToWindow() {
        super.onAttachedToWindow()
        Log.d(TAG, "Flutter容器已附加到窗口")
    }

    override fun onDetachedFromWindow() {
        super.onDetachedFromWindow()
        // 清理Fragment和事件监听器
        val activity = context as FragmentActivity
        val transaction = activity.supportFragmentManager.beginTransaction()
        transaction.remove(flutterFragment)
        transaction.commit()
        flutterFragment.eventListener = null
        handler = null
        Log.d(TAG, "Flutter容器已从窗口分离")
    }

    override fun onLayout(changed: Boolean, left: Int, top: Int, right: Int, bottom: Int) {
        super.onLayout(changed, left, top, right, bottom)
        Log.d(TAG, "Flutter容器布局: $left, $top, $right, $bottom")
    }

    override fun onMeasure(widthMeasureSpec: Int, heightMeasureSpec: Int) {
        super.onMeasure(widthMeasureSpec, heightMeasureSpec)
        Log.d(TAG, "Flutter容器测量")
    }

    /**
     * 获取Flutter Fragment
     */
    fun getFlutterFragment(): LivekitDemoFragment {
        return flutterFragment
    }
}