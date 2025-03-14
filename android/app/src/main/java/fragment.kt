package flutter
import io.flutter.embedding.android.FlutterFragment
import io.flutter.embedding.engine.FlutterEngine
import io.flutter.embedding.engine.plugins.util.GeneratedPluginRegister

@Suppress("MemberVisibilityCanBePrivate")
open class SubFlutterFragment : FlutterFragment() {
    companion object {
        @JvmStatic
        fun create(): SubFlutterFragment =
            NewEngineFragmentBuilder(SubFlutterFragment::class.java).build()
    }

    override fun configureFlutterEngine(flutterEngine: FlutterEngine) {
        super.configureFlutterEngine(flutterEngine)
        // 必须加上这个才能使用flutter插件，
        GeneratedPluginRegister.registerGeneratedPlugins(flutterEngine)
    }

}